import React from "react";
import "./Pagination.css";

interface PaginationProps {
  currentSlide: number;
  totalSlides: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentSlide, totalSlides }) => {
  return (
    <div className="pagination">
      {currentSlide + 1} / {totalSlides}
    </div>
  );
};

export default Pagination;