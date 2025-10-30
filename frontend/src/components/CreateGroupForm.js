import React, { useState } from 'react';
import './CreateGroupForm.css';

/**
 * CreateGroupForm component for creating new groups
 * 
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback when form is cancelled
 */
function CreateGroupForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Group name is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-form-container">
      <h3 className="create-group-form-title">Create New Group</h3>
      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-field">
          <label htmlFor="group-name">
            Group Name <span className="required">*</span>
          </label>
          <input
            id="group-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Study Group for CPSC221"
            maxLength={100}
            required
          />
          <p className="field-hint">Maximum 100 characters</p>
        </div>

        <div className="form-field">
          <label htmlFor="group-description">Description</label>
          <textarea
            id="group-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose of this group..."
            maxLength={1000}
            rows={4}
          />
          <p className="field-hint">Maximum 1000 characters</p>
        </div>

        <div className="form-button-group">
          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupForm;



