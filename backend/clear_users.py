import sqlite3

# Connect to database
conn = sqlite3.connect('vidhya.db')
cursor = conn.cursor()

# Show current users
print("Current users in database:")
cursor.execute('SELECT id, email, name FROM users')
for row in cursor.fetchall():
    print(f"  ID: {row[0]}, Email: {row[1]}, Name: {row[2]}")

# Delete all users
cursor.execute('DELETE FROM users')
conn.commit()

print("\nAll users deleted!")

# Verify deletion
cursor.execute('SELECT COUNT(*) FROM users')
count = cursor.fetchone()[0]
print(f"Remaining users: {count}")

conn.close()
