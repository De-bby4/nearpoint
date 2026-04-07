import React from "react";
import './UnderHero.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpa,
  faUtensils,
  faHotel,
  faDumbbell,
  faCut,
  faHospital,
  faShoppingBag,
  faUniversity,
  faSchool
} from '@fortawesome/free-solid-svg-icons';

const UnderHero = () => {

    const categories = [
        { name: 'Spa', icon: faSpa },
        { name: 'Restaurant', icon: faUtensils },
        { name: 'Hotel', icon: faHotel },
        { name: 'Gym', icon: faDumbbell },
        { name: 'Salon', icon: faCut },
        { name: 'Clinic', icon: faHospital },
        { name: 'Shopping', icon: faShoppingBag },
        // { name: 'Bank', icon: faUniversity },
        // { name: 'School', icon: faSchool },
        { name: 'Bar', icon: faUtensils }, 
    ];
    const navigate = useNavigate();

    return (
        <div className="under-container">
            <div className="category-text">
                <h4 className="div-category1">POPULAR CATEGORIES</h4>
                <h2 className="div-category2">Explore by Category</h2>
            </div>

            <div className="categories-grid">
                {categories.map((category, i) => (
                    <div 
                        key={i} 
                        className="category-card"
                        onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="div-cat">
                           <FontAwesomeIcon 
                            icon={category.icon} 
                            size="2x" 
                            className="category-icon"
                        /> 
                        </div>
                        
                        <span>{category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UnderHero;