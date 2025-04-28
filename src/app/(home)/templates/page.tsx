"use client";
import Template from "@/components/Template";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import NotFound from "@/components/NotFound";
import TemplateForm from "@/components/TemplateForm";
import { TemplateContext } from "@/context/TemplateContext";
import PageHeader from "@/components/PageHeader";

const Templates = () => {
  const user = useSelector((state: RootState) => state.user.userInfo);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | undefined>();

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8 min-h-[80dvh]">
      <PageHeader
        title="My Templates"
        description="Manage your templates here"
        action={
          <button
            data-test="add-template"
            onClick={() => {
              setOpen(true);
              setEdit(false);
              setEditTemplate(undefined);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={14} color="var(--color-theme-d)" />
            <span className="font-medium text-sm text-theme-d">
              New Template
            </span>
          </button>
        }
      />

      {user?.templates && user.templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {user.templates.map((item, index) => (
            <TemplateContext.Provider
              value={{
                template: item,
                open,
                setOpen,
                edit,
                setEdit,
                editTemplate,
                setEditTemplate,
              }}
              key={index}
            >
              <Template />
            </TemplateContext.Provider>
          ))}
        </div>
      ) : (
        <NotFound message="No Templates found." />
      )}

      <TemplateForm
        key={editTemplate?.id ?? ""}
        open={open}
        setOpen={setOpen}
        edit={edit}
        templateInfo={editTemplate}
      />
    </div>
  );
};

export default Templates;
