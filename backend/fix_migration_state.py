"""
Fix migration state mismatch
This script stamps the database with the correct migration version
"""

from app import app, db
from flask_migrate import stamp
from sqlalchemy import inspect
import sys

def check_database_state():
    """Check what tables exist in the database"""
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print("📊 Current database tables:")
        for table in sorted(tables):
            print(f"  - {table}")
        
        return tables

def fix_migration_state():
    """Stamp the database with the correct migration version"""
    with app.app_context():
        try:
            print("\n🔍 Checking database state...")
            tables = check_database_state()
            
            # Check if groups table exists
            if 'groups' in tables:
                print("\n✅ 'groups' table exists")
                print("📝 Stamping database to skip group creation migration...")
                
                # Stamp with the groups migration as already applied
                stamp(revision='a1b2c3d4e5f6')
                print("✅ Database stamped with groups migration (a1b2c3d4e5f6)")
                
                # Now apply the new posts group_id migration
                print("\n📝 Now applying the posts group_id migration...")
                from flask_migrate import upgrade
                upgrade()
                
                # Verify
                print("\n🔍 Verifying the migration...")
                inspector = inspect(db.engine)
                columns = [col['name'] for col in inspector.get_columns('posts')]
                
                if 'group_id' in columns:
                    print("✅ SUCCESS! 'group_id' column added to 'posts' table")
                else:
                    print("⚠️  Warning: 'group_id' column not found")
                
                return 0
            else:
                print("\n❌ 'groups' table doesn't exist. Running normal migration...")
                from flask_migrate import upgrade
                upgrade()
                return 0
                
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == "__main__":
    exit_code = fix_migration_state()
    sys.exit(exit_code)

