import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const BusinessActionButton = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchBusinessStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        setStatus("no-business");
        return;
      }

      const q = query(
        collection(db, "businesses"),
        where("ownerId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatus("no-business");
      } else {
        const business = snapshot.docs[0].data();
        setStatus(business.status);
      }
    };

    fetchBusinessStatus();
  }, []);

  // 🔘 BUTTON CONFIG
  const buttonMap = {
    "no-business": {
      text: "Add Business",
      action: () => navigate("/add-business"),
    },
    pending: {
      text: "Pending ⏳",
      action: () => alert("Your business is under review"),
    },
    approved: {
      text: "Dashboard",
      action: () => navigate("/dashboard"),
    },
    declined: {
      text: "Declined ❌",
      action: () => alert("Your business was declined"),
    },
  };

  if (status === "loading") return null;

  return (
    <button
      onClick={buttonMap[status].action}
      style={{
        padding: "12px 24px",
        borderRadius: "30px",
        background: "#000",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {buttonMap[status].text}
    </button>
  );
};

export default BusinessActionButton;
