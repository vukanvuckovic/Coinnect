import React, { createContext } from "react";

interface TemplateContextValue {
  template: Template;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  edit: boolean;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
  editTemplate?: Template;
  setEditTemplate: React.Dispatch<React.SetStateAction<Template | undefined>>;
}

export const TemplateContext = createContext<TemplateContextValue | null>(null);
