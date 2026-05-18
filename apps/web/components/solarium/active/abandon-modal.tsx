"use client";

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
import { Spinner } from "@/components/loaders";

type Props = {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	pending?: boolean;
	elapsedMinutes?: number;
};

export function AbandonModal({
	open,
	onConfirm,
	onCancel,
	pending = false,
	elapsedMinutes = 0,
}: Props) {
	return (
    <AlertDialog
			open={open}
			onOpenChange={(o) => !o && !pending && onCancel()}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Abandonar la sesión?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta sesión se marcará como abandonada y{" "}
						<strong>no contará para tu racha</strong>. Llevas{" "}
						{elapsedMinutes} {elapsedMinutes === 1 ? "minuto" : "minutos"}{" "}
						de estudio.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>Quedarme</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={pending}
						className="bg-red-500 text-white hover:bg-red-600"
					>
						{pending ? (
							<>
								<Spinner
									size="sm"
									className="border-white border-t-transparent"
								/>
								Saliendo
							</>
						) : (
							"Sí, abandonar"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
