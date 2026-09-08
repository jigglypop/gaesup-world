export type ProductionActionsProps = {
  stage: string;
  prompt: string;
  reference: File | undefined;
  onReference: (file: File) => void;
};

export type StudioJob = {
  id: string;
  kind: 'image' | 'model';
  state: string;
  taskId?: string;
  artifact?: string;
  blender?: { output: string };
};
