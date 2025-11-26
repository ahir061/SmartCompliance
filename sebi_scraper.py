import requests
from bs4 import BeautifulSoup
import mysql.connector
from mysql.connector import Error
from datetime import datetime

# ---------------------------------------------------------
# DATABASE CONFIGURATION
# ---------------------------------------------------------
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',          # Replace with your MySQL username
    'password': 'ahir2004_69',  # Replace with your MySQL password
    'database': 'rbi_data'    # Replace with your Database name
}

def parse_date(date_str):
    """
    Converts 'Oct 30, 2025' -> '2025-10-30' (MySQL format).
    Returns None if parsing fails.
    """
    try:
        # Strip whitespace just in case: " Oct 30, 2025 "
        clean_date = date_str.strip()
        # Parse format: %b=Month(Oct), %d=Day(30), %Y=Year(2025)
        dt_obj = datetime.strptime(clean_date, "%b %d, %Y")
        return dt_obj.strftime('%Y-%m-%d')
    except ValueError:
        return None

def extract_and_store():
    url = "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # 1. Connect to Database
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("Successfully connected to the database.")
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return

    try:
        print(f"Fetching URL: {url}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Locate the table
        target_table = None
        tables = soup.find_all('table')
        for table in tables:
            headers_text = [th.get_text(strip=True) for th in table.find_all('th')]
            if "Date" in headers_text and "Title" in headers_text:
                target_table = table
                break
        
        if not target_table:
            print("Could not locate the specific circulars table.")
            return

        # 2. Process Rows
        rows = target_table.find_all('tr')
        new_count = 0
        duplicate_count = 0

        # Insert Query
        # We use INSERT IGNORE so the script doesn't crash on duplicates,
        # it just ignores them (since we have a UNIQUE constraint on 'link').
        insert_query = """
        INSERT IGNORE INTO sebi_circulars (circular_date, title, link) 
        VALUES (%s, %s, %s)
        """

        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                raw_date = cols[0].get_text(strip=True)
                
                title_col = cols[1]
                title_text = title_col.get_text(strip=True)
                
                link_tag = title_col.find('a')
                link = link_tag['href'] if link_tag else ""

                # Convert date to SQL format
                sql_date = parse_date(raw_date)

                if sql_date and link:
                    val = (sql_date, title_text, link)
                    
                    cursor.execute(insert_query, val)
                    
                    # Check if a row was actually inserted
                    if cursor.rowcount > 0:
                        print(f"[NEW] {sql_date} - {title_text[:50]}...")
                        new_count += 1
                    else:
                        # rowcount is 0 if IGNORE triggered (duplicate)
                        duplicate_count += 1

        # 3. Commit changes
        connection.commit()
        print(f"\n--- Summary ---")
        print(f"New Records Inserted: {new_count}")
        print(f"Duplicates Skipped:   {duplicate_count}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching page: {e}")
    except Error as e:
        print(f"Database Error during processing: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    extract_and_store()
