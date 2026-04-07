import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { updatePassword, updateProfile } from "firebase/auth";
// import "./Settings.css";

const Settings = () => {

  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    try {

      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      if (password) {
        await updatePassword(user, password);
      }

      alert("Settings updated successfully");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="settings-container">

      <h2>Settings</h2>

      <div className="settings-form">

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          disabled
        />

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button onClick={handleSave}>Save Changes</button>

      </div>

    </div>
  );
};

export default Settings;