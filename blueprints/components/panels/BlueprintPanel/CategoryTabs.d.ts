import React from 'react';
import { BlueprintCategory, BlueprintType } from './types';
export type CategoryTabsProps = {
    categories: BlueprintCategory[];
    selectedCategory: BlueprintType;
    onSelectCategory: (category: BlueprintType) => void;
};
export declare const CategoryTabs: React.FC<CategoryTabsProps>;
