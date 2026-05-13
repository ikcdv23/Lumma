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

export function FoldersGrid({ folders }: FoldersGridProps) {
    
}