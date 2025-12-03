import os
from datetime import datetime
import json
from typing import Optional, List, Dict

# Check if PostgreSQL URL is provided (production)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Production: Use PostgreSQL
    import psycopg2
    from psycopg2.extras import RealDictCursor
    USE_POSTGRES = True
else:
    # Development: Use SQLite
    import sqlite3
    USE_POSTGRES = False

class Database:
    def __init__(self, db_path: str = "vidhya.db"):
        self.db_path = db_path
        self.db_url = DATABASE_URL
        self.init_db()

    def get_connection(self):
        if USE_POSTGRES:
            conn = psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
            return conn
        else:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            return conn

    def init_db(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()

        if USE_POSTGRES:
            # PostgreSQL syntax
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    registration_number VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS patients (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    age INTEGER,
                    gender VARCHAR(50),
                    phone VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prescriptions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    patient_id INTEGER NOT NULL,
                    symptoms TEXT NOT NULL,
                    health_conditions TEXT,
                    diagnosis_primary TEXT,
                    diagnosis_secondary TEXT,
                    diagnosis_ayurvedic TEXT,
                    medicines TEXT NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (patient_id) REFERENCES patients(id)
                )
            ''')
        else:
            # SQLite syntax
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    phone TEXT,
                    registration_number TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    age INTEGER,
                    gender TEXT,
                    phone TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prescriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    patient_id INTEGER NOT NULL,
                    symptoms TEXT NOT NULL,
                    health_conditions TEXT,
                    diagnosis_primary TEXT,
                    diagnosis_secondary TEXT,
                    diagnosis_ayurvedic TEXT,
                    medicines TEXT NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (patient_id) REFERENCES patients(id)
                )
            ''')

        conn.commit()
        conn.close()

    # User methods
    def create_user(self, email: str, password: str, name: str, phone: str = None, registration_number: str = None) -> Optional[int]:
        """Create a new user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            if USE_POSTGRES:
                cursor.execute(
                    "INSERT INTO users (email, password, name, phone, registration_number) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (email, password, name, phone, registration_number)
                )
                user_id = cursor.fetchone()['id']
            else:
                cursor.execute(
                    "INSERT INTO users (email, password, name, phone, registration_number) VALUES (?, ?, ?, ?, ?)",
                    (email, password, name, phone, registration_number)
                )
                user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            return user_id
        except (sqlite3.IntegrityError if not USE_POSTGRES else Exception):
            return None

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        else:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        else:
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    # Patient methods
    def create_patient(self, user_id: int, name: str, age: int, gender: str, phone: str = None) -> int:
        """Create a new patient"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                "INSERT INTO patients (user_id, name, age, gender, phone) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (user_id, name, age, gender, phone)
            )
            patient_id = cursor.fetchone()['id']
        else:
            cursor.execute(
                "INSERT INTO patients (user_id, name, age, gender, phone) VALUES (?, ?, ?, ?, ?)",
                (user_id, name, age, gender, phone)
            )
            patient_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return patient_id

    def get_patient(self, patient_id: int, user_id: int) -> Optional[Dict]:
        """Get patient by ID (must belong to user)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                "SELECT * FROM patients WHERE id = %s AND user_id = %s",
                (patient_id, user_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM patients WHERE id = ? AND user_id = ?",
                (patient_id, user_id)
            )
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    def get_user_patients(self, user_id: int) -> List[Dict]:
        """Get all patients for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                "SELECT * FROM patients WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def search_patients(self, user_id: int, query: str) -> List[Dict]:
        """Search patients by name"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                "SELECT * FROM patients WHERE user_id = %s AND name LIKE %s ORDER BY created_at DESC",
                (user_id, f"%{query}%")
            )
        else:
            cursor.execute(
                "SELECT * FROM patients WHERE user_id = ? AND name LIKE ? ORDER BY created_at DESC",
                (user_id, f"%{query}%")
            )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    # Prescription methods
    def create_prescription(self, user_id: int, patient_id: int, symptoms: List[str],
                           health_conditions: List[str], diagnosis: Dict,
                           medicines: List[Dict], notes: str = None) -> int:
        """Create a new prescription"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                """INSERT INTO prescriptions
                   (user_id, patient_id, symptoms, health_conditions,
                    diagnosis_primary, diagnosis_secondary, diagnosis_ayurvedic,
                    medicines, notes)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    user_id,
                    patient_id,
                    json.dumps(symptoms),
                    json.dumps(health_conditions),
                    diagnosis.get('primary_condition', ''),
                    json.dumps(diagnosis.get('secondary_conditions', [])),
                    diagnosis.get('ayurvedic_analysis', ''),
                    json.dumps(medicines),
                    notes
                )
            )
            prescription_id = cursor.fetchone()['id']
        else:
            cursor.execute(
                """INSERT INTO prescriptions
                   (user_id, patient_id, symptoms, health_conditions,
                    diagnosis_primary, diagnosis_secondary, diagnosis_ayurvedic,
                    medicines, notes)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_id,
                    patient_id,
                    json.dumps(symptoms),
                    json.dumps(health_conditions),
                    diagnosis.get('primary_condition', ''),
                    json.dumps(diagnosis.get('secondary_conditions', [])),
                    diagnosis.get('ayurvedic_analysis', ''),
                    json.dumps(medicines),
                    notes
                )
            )
            prescription_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return prescription_id

    def get_prescription(self, prescription_id: int, user_id: int) -> Optional[Dict]:
        """Get prescription by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                "SELECT * FROM prescriptions WHERE id = %s AND user_id = %s",
                (prescription_id, user_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM prescriptions WHERE id = ? AND user_id = ?",
                (prescription_id, user_id)
            )
        row = cursor.fetchone()
        conn.close()
        if row:
            data = dict(row)
            # Parse JSON fields
            data['symptoms'] = json.loads(data['symptoms'])
            data['health_conditions'] = json.loads(data['health_conditions'])
            data['diagnosis_secondary'] = json.loads(data['diagnosis_secondary'])
            data['medicines'] = json.loads(data['medicines'])
            return data
        return None

    def get_patient_prescriptions(self, patient_id: int, user_id: int) -> List[Dict]:
        """Get all prescriptions for a patient"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                """SELECT * FROM prescriptions
                   WHERE patient_id = %s AND user_id = %s
                   ORDER BY created_at DESC""",
                (patient_id, user_id)
            )
        else:
            cursor.execute(
                """SELECT * FROM prescriptions
                   WHERE patient_id = ? AND user_id = ?
                   ORDER BY created_at DESC""",
                (patient_id, user_id)
            )
        rows = cursor.fetchall()
        conn.close()

        prescriptions = []
        for row in rows:
            data = dict(row)
            # Parse JSON fields
            data['symptoms'] = json.loads(data['symptoms'])
            data['health_conditions'] = json.loads(data['health_conditions'])
            data['diagnosis_secondary'] = json.loads(data['diagnosis_secondary'])
            data['medicines'] = json.loads(data['medicines'])
            prescriptions.append(data)
        return prescriptions

    def get_user_prescriptions(self, user_id: int, limit: int = 50) -> List[Dict]:
        """Get recent prescriptions for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if USE_POSTGRES:
            cursor.execute(
                """SELECT p.*, pt.name as patient_name, pt.age as patient_age, pt.gender as patient_gender
                   FROM prescriptions p
                   JOIN patients pt ON p.patient_id = pt.id
                   WHERE p.user_id = %s
                   ORDER BY p.created_at DESC
                   LIMIT %s""",
                (user_id, limit)
            )
        else:
            cursor.execute(
                """SELECT p.*, pt.name as patient_name, pt.age as patient_age, pt.gender as patient_gender
                   FROM prescriptions p
                   JOIN patients pt ON p.patient_id = pt.id
                   WHERE p.user_id = ?
                   ORDER BY p.created_at DESC
                   LIMIT ?""",
                (user_id, limit)
            )
        rows = cursor.fetchall()
        conn.close()

        prescriptions = []
        for row in rows:
            data = dict(row)
            # Parse JSON fields
            data['symptoms'] = json.loads(data['symptoms'])
            data['health_conditions'] = json.loads(data['health_conditions'])
            data['diagnosis_secondary'] = json.loads(data['diagnosis_secondary'])
            data['medicines'] = json.loads(data['medicines'])
            prescriptions.append(data)
        return prescriptions

    def find_similar_prescriptions(self, symptoms: List[str], health_conditions: List[str],
                                   user_id: int = None, limit: int = 10) -> List[Dict]:
        """Find similar prescriptions based on symptoms and health conditions"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get all prescriptions (optionally filtered by user)
        if user_id:
            if USE_POSTGRES:
                cursor.execute(
                    """SELECT * FROM prescriptions WHERE user_id = %s ORDER BY created_at DESC""",
                    (user_id,)
                )
            else:
                cursor.execute(
                    """SELECT * FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC""",
                    (user_id,)
                )
        else:
            cursor.execute("SELECT * FROM prescriptions ORDER BY created_at DESC")

        rows = cursor.fetchall()
        conn.close()

        # Calculate similarity scores
        similar_prescriptions = []
        symptoms_lower = [s.lower().strip() for s in symptoms]
        conditions_lower = [c.lower().strip() for c in health_conditions]

        for row in rows:
            data = dict(row)
            # Parse JSON fields
            data['symptoms'] = json.loads(data['symptoms'])
            data['health_conditions'] = json.loads(data['health_conditions'])
            data['diagnosis_secondary'] = json.loads(data['diagnosis_secondary'])
            data['medicines'] = json.loads(data['medicines'])

            # Calculate similarity score
            prescription_symptoms = [s.lower().strip() for s in data['symptoms']]
            prescription_conditions = [c.lower().strip() for c in data['health_conditions']]

            # Count matching symptoms
            symptom_matches = sum(1 for s in symptoms_lower if s in prescription_symptoms)
            # Count matching conditions
            condition_matches = sum(1 for c in conditions_lower if c in prescription_conditions)

            # Calculate total similarity (weighted: symptoms more important)
            total_score = (symptom_matches * 2) + condition_matches

            if total_score > 0:  # Only include if there's at least one match
                data['similarity_score'] = total_score
                data['symptom_matches'] = symptom_matches
                data['condition_matches'] = condition_matches
                similar_prescriptions.append(data)

        # Sort by similarity score (highest first)
        similar_prescriptions.sort(key=lambda x: x['similarity_score'], reverse=True)

        return similar_prescriptions[:limit]

# Global database instance
db = Database()
