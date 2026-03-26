import React, { useState, useEffect } from 'react';

const DynamicSignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    institute: '',
    class: '',
    field: '',
    email: '',
    password: ''
  });

  const [institutes, setInstitutes] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);

  // Education level options
  const educationLevels = [
    { value: 'School', label: 'School' },
    { value: 'College', label: 'College' },
    { value: 'University', label: 'University' }
  ];

  // School classes
  const schoolClasses = [
    { value: '8', label: 'Class 8' },
    { value: '9', label: 'Class 9' },
    { value: '10', label: 'Class 10' }
  ];

  // College years
  const collegeYears = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' }
  ];

  // College fields
  const collegeFields = [
    { value: 'Pre-Engineering', label: 'Pre-Engineering' },
    { value: 'Pre-Medical', label: 'Pre-Medical' }
  ];

  // University levels
  const universityLevels = [
    { value: 'Undergraduate', label: 'Undergraduate' }
  ];

  // University fields
  const universityFields = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'BBA', label: 'BBA' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Arts', label: 'Arts' }
  ];

  // Load institutes based on education level
  useEffect(() => {
    if (formData.level) {
      loadInstitutes(formData.level);
    }
  }, [formData.level]);

  const loadInstitutes = async (level) => {
    setLoadingInstitutes(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/institutes?type=${level}`);
      const data = await response.json();
      // Show only 8-10 institutes
      setInstitutes(data.slice(0, 10));
    } catch (error) {
      console.error('Error loading institutes:', error);
      // Fallback data for demo
      setInstitutes([
        { institute_id: '1', name: 'Sample Institute 1' },
        { institute_id: '2', name: 'Sample Institute 2' },
        { institute_id: '3', name: 'Sample Institute 3' }
      ]);
    } finally {
      setLoadingInstitutes(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields when level changes
      ...(field === 'level' && { institute: '', class: '', field: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your signup logic here
  };

  const renderEducationFields = () => {
    switch (formData.level) {
      case 'School':
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Institute
              </label>
              <select
                value={formData.institute}
                onChange={(e) => handleInputChange('institute', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loadingInstitutes}
              >
                <option value="">
                  {loadingInstitutes ? 'Loading...' : 'Select your institute'}
                </option>
                {institutes.map(inst => (
                  <option key={inst.institute_id} value={inst.institute_id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Class
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your class</option>
                {schoolClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'College':
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Institute
              </label>
              <select
                value={formData.institute}
                onChange={(e) => handleInputChange('institute', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loadingInstitutes}
              >
                <option value="">
                  {loadingInstitutes ? 'Loading...' : 'Select your institute'}
                </option>
                {institutes.map(inst => (
                  <option key={inst.institute_id} value={inst.institute_id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your year</option>
                {collegeYears.map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field
              </label>
              <select
                value={formData.field}
                onChange={(e) => handleInputChange('field', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your field</option>
                {collegeFields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'University':
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Institute
              </label>
              <select
                value={formData.institute}
                onChange={(e) => handleInputChange('institute', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loadingInstitutes}
              >
                <option value="">
                  {loadingInstitutes ? 'Loading...' : 'Select your institute'}
                </option>
                {institutes.map(inst => (
                  <option key={inst.institute_id} value={inst.institute_id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your level</option>
                {universityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field
              </label>
              <select
                value={formData.field}
                onChange={(e) => handleInputChange('field', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your field</option>
                {universityFields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Create Your Account
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Join thousands of students improving their performance
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                Personal Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Education Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                Education Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Education Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select your education level</option>
                  {educationLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Fields */}
              {renderEducationFields()}
            </div>

            {/* Account Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                Account Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password (min 6 characters)"
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DynamicSignupForm;