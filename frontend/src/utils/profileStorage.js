// utils/profileStorage.js
export const saveProfileData = (data) => {
  const profileData = {
    ...data,
    membershipNumber: data.membershipNumber || generateMembershipNumber(),
    joinedDate: data.joinedDate || new Date().toLocaleDateString('en-IN'),
    validTill: data.validTill || generateValidTillDate(),
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('nppProfile', JSON.stringify(profileData));
  return profileData;
};

export const getProfileData = () => {
  const saved = localStorage.getItem('nppProfile');
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error parsing profile data:', error);
    return null;
  }
};

export const clearProfileData = () => {
  localStorage.removeItem('nppProfile');
};

const generateMembershipNumber = () => {
  const prefix = 'NPP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

const generateValidTillDate = () => {
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  return oneYearLater.toLocaleDateString('en-IN');
};