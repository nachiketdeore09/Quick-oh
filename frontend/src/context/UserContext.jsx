import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  //Updating the role of user
  const updateRole = (newRole) => {
    localStorage.setItem("role", newRole);
    setRole(newRole);
  };

  //updating the profile image of user
  const updateProfileImage = (newImageUrl) => {
    localStorage.setItem("profileImage", newImageUrl);
    setProfileImage(newImageUrl);
  };

  useEffect(() => {
    setProfileImage(localStorage.getItem("profileImage") || "");
    setRole(localStorage.getItem("role") || "");
  }, []);

  return (
    <UserContext.Provider
      value={{ profileImage, updateProfileImage, role, updateRole }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
