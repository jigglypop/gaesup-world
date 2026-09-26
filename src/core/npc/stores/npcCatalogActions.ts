import type { NPCGet, NPCSet, NPCStore, NPCStoreContext } from './npcStoreTypes';
import { registerNPCBrainBlueprint, unregisterNPCBrainBlueprint } from '../core/blueprint';

/** Templates, categories, clothing, animations, brain blueprints and the editor's selection. */
export function createNPCCatalogActions(set: NPCSet, _get: NPCGet, { legacyBlueprintRegistry }: NPCStoreContext) {
  return {
    addTemplate: (template) => set((state) => {
      state.templates.set(template.id, template);
    }),

    updateTemplate: (id, updates) => set((state) => {
      const template = state.templates.get(id);
      if (template) {
        state.templates.set(id, { ...template, ...updates });
      }
    }),

    removeTemplate: (id) => set((state) => {
      state.templates.delete(id);
    }),

    addCategory: (category) => set((state) => {
      state.categories.set(category.id, category);
    }),

    updateCategory: (id, updates) => set((state) => {
      const category = state.categories.get(id);
      if (category) {
        state.categories.set(id, { ...category, ...updates });
      }
    }),

    removeCategory: (id) => set((state) => {
      state.categories.delete(id);
    }),

    addClothingSet: (clothingSet) => set((state) => {
      state.clothingSets.set(clothingSet.id, clothingSet);
    }),

    updateClothingSet: (id, updates) => set((state) => {
      const set = state.clothingSets.get(id);
      if (set) {
        state.clothingSets.set(id, { ...set, ...updates });
      }
    }),

    removeClothingSet: (id) => set((state) => {
      state.clothingSets.delete(id);
    }),

    addClothingCategory: (category) => set((state) => {
      state.clothingCategories.set(category.id, category);
    }),

    updateClothingCategory: (id, updates) => set((state) => {
      const category = state.clothingCategories.get(id);
      if (category) {
        state.clothingCategories.set(id, { ...category, ...updates });
      }
    }),

    removeClothingCategory: (id) => set((state) => {
      state.clothingCategories.delete(id);
    }),

    addAnimation: (animation) => set((state) => {
      state.animations.set(animation.id, animation);
    }),

    updateAnimation: (id, updates) => set((state) => {
      const animation = state.animations.get(id);
      if (animation) {
        state.animations.set(id, { ...animation, ...updates });
      }
    }),

    removeAnimation: (id) => set((state) => {
      state.animations.delete(id);
    }),

    addBrainBlueprint: (blueprint) => set((state) => {
      state.brainBlueprints.set(blueprint.id, blueprint);
      if (legacyBlueprintRegistry) registerNPCBrainBlueprint(blueprint);
    }),

    updateBrainBlueprint: (id, updates) => set((state) => {
      const blueprint = state.brainBlueprints.get(id);
      if (!blueprint) return;
      const nextBlueprint = { ...blueprint, ...updates };
      state.brainBlueprints.set(id, nextBlueprint);
      if (legacyBlueprintRegistry) registerNPCBrainBlueprint(nextBlueprint);
    }),

    removeBrainBlueprint: (id) => set((state) => {
      state.brainBlueprints.delete(id);
      if (legacyBlueprintRegistry) unregisterNPCBrainBlueprint(id);
    }),

    setSelectedTemplate: (id) => set((state) => {
      state.selectedTemplateId = id;
    }),

    setSelectedCategory: (id) => set((state) => {
      state.selectedCategoryId = id;
      const category = state.categories.get(id);
      if (category && category.templateIds.length > 0) {
        const firstTemplateId = category.templateIds[0];
        if (firstTemplateId) state.selectedTemplateId = firstTemplateId;
      } else {
        delete state.selectedTemplateId;
      }
    }),

    setSelectedInstance: (id) => set((state) => {
      state.selectedInstanceId = id;
    }),

    setSelectedClothingSet: (id) => set((state) => {
      state.selectedClothingSetId = id;
    }),

    setSelectedClothingCategory: (id) => set((state) => {
      state.selectedClothingCategoryId = id;
      const category = state.clothingCategories.get(id);
      if (category && category.clothingSetIds.length > 0) {
        const firstSetId = category.clothingSetIds[0];
        if (firstSetId) state.selectedClothingSetId = firstSetId;
      } else {
        delete state.selectedClothingSetId;
      }
    }),
  } satisfies Partial<NPCStore>;
}
