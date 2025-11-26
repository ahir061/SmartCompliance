import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Date, Boolean, ForeignKey,
    TIMESTAMP, func
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.dialects.mysql import LONGBLOB
from PyPDF2 import PdfReader
import io

DB_USER = "root"
DB_PASSWORD = "ahir2004_69"
DB_HOST = "localhost"
DB_NAME = "rbi_data"

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False)
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()


class Circular(Base):
    __tablename__ = "circulars"

    id = Column(Integer, primary_key=True, autoincrement=True)
    circular_number = Column(String(255), unique=True, nullable=False)
    date_of_issue = Column(Date)
    department = Column(String(255))
    subject = Column(Text)
    meant_for = Column(String(255))
    circular_url = Column(Text)
    pdf_blob = Column(LONGBLOB, nullable=True)
    pdf_text = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    references = relationship("Reference", back_populates="circular", cascade="all, delete")


class Reference(Base):
    __tablename__ = "circular_references"

    id = Column(Integer, primary_key=True, autoincrement=True)
    circular_id = Column(Integer, ForeignKey("circulars.id", ondelete="CASCADE"))
    reference_text = Column(Text)
    reference_url = Column(Text)
    link_type = Column(String(100))
    is_pdf = Column(Boolean, default=False)
    pdf_blob = Column(LONGBLOB, nullable=True)
    pdf_text = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    circular = relationship("Circular", back_populates="references")


Base.metadata.create_all(engine)


import re
import string

def clean_text(text):
    if not text:
        return None

    # Remove invalid unicode characters (� and others)
    text = text.encode("utf-8", "ignore").decode("utf-8", "ignore")

    # Remove non-printable / control chars
    text = "".join(ch for ch in text if ch.isprintable())

    # Remove weird sequences like "��", "�", etc.
    text = re.sub(r"[^\x00-\x7F]+", " ", text)

    # Replace multiple spaces/newlines
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_pdf_text(pdf_bytes):
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []

        for page in reader.pages:
            raw = page.extract_text()
            if raw:
                cleaned = clean_text(raw)
                if cleaned:
                    pages_text.append(cleaned)

        return "\n".join(pages_text)

    except Exception as e:
        print(f"PDF extraction error: {e}")
        return None




def scrape_circular_index():
    base_url = "https://www.rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx"
    r = requests.get(base_url)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    circulars = []
    for row in soup.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) >= 5:
            link_tag = cols[0].find("a", href=True)
            if link_tag:
                circular_number = link_tag.get_text(strip=True)
                circular_url = urljoin(base_url, link_tag["href"])
                date_of_issue = cols[1].get_text(strip=True)
                department = cols[2].get_text(strip=True)
                subject = cols[3].get_text(strip=True)
                meant_for = cols[4].get_text(strip=True)
                circulars.append({
                    "circular_number": circular_number,
                    "date_of_issue": date_of_issue,
                    "department": department,
                    "subject": subject,
                    "meant_for": meant_for,
                    "circular_url": circular_url
                })
    return circulars


def fetch_circular_pdf(circular_url):
    try:
        r = requests.get(circular_url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        pdf_tag = soup.find("a", href=lambda x: x and x.lower().endswith(".pdf"))
        if pdf_tag:
            pdf_link = urljoin(circular_url, pdf_tag["href"])
            pdf_response = requests.get(pdf_link, timeout=15)
            pdf_response.raise_for_status()
            pdf_blob = pdf_response.content
            pdf_text = extract_pdf_text(pdf_blob)
            return pdf_blob, pdf_text
    except Exception as e:
        print(f"Failed to fetch circular PDF from {circular_url}: {e}")
    return None, None


def scrape_references(circular_url):
    refs = []

    try:
        r = requests.get(circular_url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        content_area = (
            soup.find("div", id="content") or
            soup.find("div", class_="content") or
            soup.find("table") or
            soup
        )

        for a in content_area.find_all("a", href=True):

            text = a.get_text(strip=True)
            href = urljoin(circular_url, a["href"])

            if not text or href.startswith("#") or "javascript" in href.lower():
                continue

            # ---- DETECT TYPE ----
            text_lower = text.lower()

            if "direction" in text_lower:
                link_type = "Master Direction"
            elif "master circular" in text_lower:
                link_type = "Master Circular"
            elif "notification" in text_lower:
                link_type = "Notification"
            else:
                link_type = "Other"

            pdf_blob = None
            pdf_text = None

            # ----------------------------------------------------
            # 1) CASE: DIRECT PDF IN href
            # ----------------------------------------------------
            if href.lower().endswith(".pdf"):
                try:
                    pdf_response = requests.get(href, timeout=20)
                    pdf_response.raise_for_status()
                    pdf_blob = pdf_response.content
                    pdf_text = extract_pdf_text(pdf_blob)
                except Exception as e:
                    print("Direct PDF error:", e)

            # ----------------------------------------------------
            # 2) CASE: REFERENCE PAGE → NEED TO FIND PDF INSIDE
            # ----------------------------------------------------
            if pdf_blob is None:
                try:
                    sub_r = requests.get(href, timeout=15)
                    sub_r.raise_for_status()
                    sub_soup = BeautifulSoup(sub_r.text, "html.parser")

                    # Look for ANY PDF in the referenced page
                    pdf_tag = sub_soup.find("a", href=lambda x: x and ".pdf" in x.lower())

                    if pdf_tag:
                        nested_pdf = urljoin(href, pdf_tag["href"])
                        try:
                            pdf_response = requests.get(nested_pdf, timeout=20)
                            pdf_response.raise_for_status()
                            pdf_blob = pdf_response.content
                            pdf_text = extract_pdf_text(pdf_blob)
                        except Exception as e:
                            print("Nested PDF download error:", e)

                except Exception:
                    pass

            refs.append({
                "reference_text": text,
                "reference_url": href,
                "link_type": link_type,
                "is_pdf": pdf_blob is not None,
                "pdf_blob": pdf_blob,
                "pdf_text": pdf_text,
            })

        # Remove duplicates based on reference_url
        return list({ref["reference_url"]: ref for ref in refs}.values())

    except Exception as e:
        print("Reference scrape error:", e)
        return []



def store_data():
    circulars = scrape_circular_index()
    for circ in circulars:
        try:
            date_obj = datetime.strptime(circ["date_of_issue"], "%d.%m.%Y").date()
        except:
            date_obj = None
        existing = session.query(Circular).filter_by(circular_number=circ["circular_number"]).first()
        if existing:
            print(f"Skipping existing circular: {circ['circular_number']}")
            continue
        pdf_blob, pdf_text = fetch_circular_pdf(circ["circular_url"])
        new_circ = Circular(
            circular_number=circ["circular_number"],
            date_of_issue=date_obj,
            department=circ["department"],
            subject=circ["subject"],
            meant_for=circ["meant_for"],
            circular_url=circ["circular_url"],
            pdf_blob=pdf_blob,
            pdf_text=pdf_text
        )
        session.add(new_circ)
        session.commit()
        print(f"Added Circular: {circ['circular_number']}")
        references = scrape_references(circ["circular_url"])
        for ref in references:
            new_ref = Reference(
                circular_id=new_circ.id,
                reference_text=ref["reference_text"],
                reference_url=ref["reference_url"],
                link_type=ref["link_type"],
                is_pdf=ref["is_pdf"],
                pdf_blob=ref["pdf_blob"],
                pdf_text=ref["pdf_text"]
            )
            session.add(new_ref)
        session.commit()
        print(f"   ↳ Added {len(references)} references.")
        time.sleep(1)
    print("All circulars and their references stored successfully!")

def update_references_only():
    circulars = session.query(Circular).all()

    for circ in circulars:
        print(f"\nUpdating references for: {circ.circular_number}")

        # Delete old references
        session.query(Reference).filter_by(circular_id=circ.id).delete()
        session.commit()

        # Re-scrape references
        refs = scrape_references(circ.circular_url)

        for ref in refs:
            session.add(Reference(
                circular_id=circ.id,
                reference_text=ref["reference_text"],
                reference_url=ref["reference_url"],
                link_type=ref["link_type"],
                is_pdf=ref["is_pdf"],
                pdf_blob=ref["pdf_blob"],
                pdf_text=ref["pdf_text"]
            ))

        session.commit()
        print(f"   ↳ Added {len(refs)} references.")



if __name__ == "__main__":
    update_references_only()
