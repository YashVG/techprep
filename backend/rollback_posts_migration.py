"""
Rollback the group posts migration
This script can be run directly: python rollback_posts_migration.py
"""

from app import app, db
from flask_migrate import downgrade
import sys

def rollback_migration():
    """Rollback one migration"""
    with app.app_context():
        try:
            print("Rolling back migration...")
            
            # Downgrade by one version
            downgrade(revision='-1')
            
            print("✅ Migration rolled back successfully!")
            
            # Verify the rollback
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('posts')]
            
            if 'group_id' not in columns:
                print("✅ Verified: 'group_id' column removed from 'posts' table")
            else:
                print("⚠️  Warning: 'group_id' column still exists.")
            
            return 0
            
        except Exception as e:
            print(f"❌ Error rolling back migration: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == "__main__":
    exit_code = rollback_migration()
    sys.exit(exit_code)

