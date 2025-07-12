import React from 'react';
import { BlueprintCategory, BlueprintType } from '../types';

export type CategoryTabsProps = {
  categories: BlueprintCategory[];
  selectedCategory: BlueprintType;
  onSelectCategory: (category: BlueprintType) => void;
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="blueprint-panel__categories">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`blueprint-panel__category ${
            selectedCategory === category.type 
              ? 'blueprint-panel__category--active' 
              : ''
          }`}
          onClick={() => onSelectCategory(category.type)}
        >
          <span className="blueprint-panel__category-name">
            {category.name}
          </span>
          <span className="blueprint-panel__category-count">
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
}; 