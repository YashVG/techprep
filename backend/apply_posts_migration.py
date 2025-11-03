"""
Apply database migration for group posts feature
This script can be run directly: python apply_posts_migration.py
"""

from app import app, db
from flask_migrate import upgrade
import sys

def apply_migration():
    """Apply the group posts migration"""
    with app.app_context():
        try:
            print("Starting migration...")
            print("Current database URI:", app.config['SQLALCHEMY_DATABASE_URI'])
            
            # Apply all pending migrations
            upgrade()
            
            print("✅ Migration applied successfully!")
            print("The 'posts' table now has a 'group_id' column.")
            
            # Verify the migration
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('posts')]
            
            if 'group_id' in columns:
                print("✅ Verified: 'group_id' column exists in 'posts' table")
            else:
                print("⚠️  Warning: 'group_id' column not found. Migration may not have applied.")
            
            return 0
            
        except Exception as e:
            print(f"❌ Error applying migration: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == "__main__":
    exit_code = apply_migration()
    sys.exit(exit_code)

