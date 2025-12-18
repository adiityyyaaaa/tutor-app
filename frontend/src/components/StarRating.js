import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, editable = false, onChange, size = "w-5 h-5" }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index) => {
        if (editable) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (editable) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (editable && onChange) {
            onChange(index);
        }
    };

    return (
        <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = index <= (hoverRating || rating);
                const isGold = isFilled;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
                        disabled={!editable}
                    >
                        <Star
                            className={`${size} ${isGold ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
