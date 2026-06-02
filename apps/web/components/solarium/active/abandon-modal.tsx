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

/**
 * Modal especializado para abandono de sesión Solarium. Existe aparte del
 * ConfirmProvider porque el flujo de abandono necesita mantener el modal
 * abierto durante la llamada al servidor mostrando spinner — el
 * ConfirmProvider genérico cierra inmediatamente al confirmar y no encaja.
 *
 * Estética alineada con ConfirmProvider via tokens `bg-destructive`.
 */
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
						className="bg-destructive text-white hover:bg-destructive/90"
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
