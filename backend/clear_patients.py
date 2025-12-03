import sqlite3

# Connect to database
conn = sqlite3.connect('vidhya.db')
cursor = conn.cursor()

# Delete all prescriptions first (due to foreign key constraint)
cursor.execute("DELETE FROM prescriptions")
print(f"Deleted {cursor.rowcount} prescriptions")

# Delete all patients
cursor.execute("DELETE FROM patients")
print(f"Deleted {cursor.rowcount} patients")

# Commit changes
conn.commit()
conn.close()

print("All patient and prescription records have been cleared from the database")
