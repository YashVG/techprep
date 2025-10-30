#!/usr/bin/env python3
"""
Script to apply the groups migration
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from sqlalchemy import text

def apply_migration():
    """Apply the groups and group_members tables migration"""
    with app.app_context():
        # Check if tables already exist
        inspector = db.inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if 'groups' in existing_tables and 'group_members' in existing_tables:
            print("✓ Tables 'groups' and 'group_members' already exist!")
            return
        
        print("Creating 'groups' and 'group_members' tables...")
        
        # Create groups table
        if 'groups' not in existing_tables:
            db.session.execute(text("""
                CREATE TABLE groups (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    creator_id INTEGER NOT NULL,
                    FOREIGN KEY (creator_id) REFERENCES users(id)
                )
            """))
            print("✓ Created 'groups' table")
        
        # Create group_members table
        if 'group_members' not in existing_tables:
            db.session.execute(text("""
                CREATE TABLE group_members (
                    user_id INTEGER NOT NULL,
                    group_id INTEGER NOT NULL,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, group_id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (group_id) REFERENCES groups(id)
                )
            """))
            print("✓ Created 'group_members' table")
        
        db.session.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == '__main__':
    try:
        apply_migration()
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)



