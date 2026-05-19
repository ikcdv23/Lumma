"use client";

import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
	title: string;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

type PendingState = {
	options: ConfirmOptions;
	resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
	const [pending, setPending] = useState<PendingState | null>(null);

	const confirm = useCallback<ConfirmContextValue>((options) => {
		return new Promise<boolean>((resolve) => {
			setPending({ options, resolve });
		});
	}, []);

	function handleConfirm() {
		pending?.resolve(true);
		setPending(null);
	}

	function handleCancel() {
		pending?.resolve(false);
		setPending(null);
	}

	const opts = pending?.options;

	return (
		<ConfirmContext.Provider value={confirm}>
			{children}
			<AlertDialog
				open={pending !== null}
				onOpenChange={(o) => !o && handleCancel()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{opts?.title}</AlertDialogTitle>
						{opts?.description && (
							<AlertDialogDescription>
								{opts.description}
							</AlertDialogDescription>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{opts?.cancelLabel ?? "Cancelar"}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className={
								opts?.destructive
									? "bg-destructive text-white hover:bg-destructive/90"
									: undefined
							}
						>
							{opts?.confirmLabel ?? "Confirmar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</ConfirmContext.Provider>
	);
}

export function useConfirm() {
	const confirm = useContext(ConfirmContext);
	if (!confirm) {
		throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
	}
	return confirm;
}
