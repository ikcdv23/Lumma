"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderOpen } from "lucide-react";

type Folder = {
    id: string;
    name: string;
    _count: { notes: number };
}

type FoldersGridProps = {
    folders: Folder[];
};

export function SelectMaterialsGrid({ folders }: FoldersGridProps) {
    return (
        <div className="m-4 p-6 flex border-ro">

            <div className="m-4 p-6 flex items-start just">

            </div>
        </div>
    );
};