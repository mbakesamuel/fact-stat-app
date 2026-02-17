"use client";
import CreateUserForm from "@/app/components/createUserForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Roles } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function AccountCreation() {
  const { user } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);

  const Roles: Roles[] = [
    {
      id: 1,
      role: "admin",
    },
    { id: 2, role: "user" },
    { id: 3, role: "mrp" },
    { id: 4, role: "pd" },
    { id: 5, role: "homc" },
  ];

  console.log(user?.publicMetadata.role);

  if (!user || (user?.publicMetadata.role as string) !== "admin") {
    return <p>Access denied</p>;
  }

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div className="flex overflow-y-auto">
      <div>
        <Button className="bg-emerald-500" onClick={() => setDialogOpen(true)}>
          Create Account
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-none overflow-y-auto md:w-full md:h-auto md:max-w-lg">
          <DialogHeader className="flex uppercase mb-8">
            <DialogTitle>Create User Account</DialogTitle>
          </DialogHeader>
          <div>
            <CreateUserForm roles={Roles} onClose={handleClose} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
