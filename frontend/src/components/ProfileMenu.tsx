import React from "react";

interface ProfileMenuProps {
  onGoBudget: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onGoBudget }) => {
  return (
    // Dropdown container for profile navigation 
    <div className="profile-menu">
      {/* Takes user to profile page */}
      <button className="profile-item">Profile</button>
      {/* Takes user to budget page */}
      <button className="profile-item" onClick={onGoBudget}>Budget</button>
      {/* Takes user to contact page */}
      <button className="profile-item">Contact</button>
    </div>
  );
};

export default ProfileMenu;
