"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Options = {
	when: boolean;
	onConfirmExit: () => Promise<void>;
	onUnload?: () => void;
};

const BACK_MARKER = "__BACK__";

export function useNavigationGuard({
	when,
	onConfirmExit,
	onUnload,
}: Options) {
	const router = useRouter();
	const [pendingHref, setPendingHref] = useState<string | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);

	const onUnloadRef = useRef(onUnload);
	useEffect(() => {
		onUnloadRef.current = onUnload;
	}, [onUnload]);

	const isExitingRef = useRef(false);

	useEffect(() => {
		if (!when) return;

		function onClick(e: MouseEvent) {
			if (isExitingRef.current) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

			const target = e.target as HTMLElement | null;
			const anchor = target?.closest?.("a");
			if (!anchor) return;

			const href = anchor.getAttribute("href");
			if (!href) return;
			if (href.startsWith("#")) return;
			if (anchor.target === "_blank") return;

			e.preventDefault();
			e.stopPropagation();
			setPendingHref(href);
		}

		// capture: true → correr antes que el listener de Next, que
		// consumiría el evento y navegaría.
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, [when]);

	useEffect(() => {
		if (!when) return;

		// Truco del "estado dummy": al duplicar la URL en history, el back
		// del navegador popea el dummy y dispara popstate sin cambiar la
		// URL. Eso es nuestra ventana para interceptar y mostrar el modal.
		history.pushState({ __guard: true }, "", window.location.href);

		function onPop() {
			if (isExitingRef.current) return;
			history.pushState({ __guard: true }, "", window.location.href);
			setPendingHref(BACK_MARKER);
		}

		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [when]);

	// bfcache restore: la página vuelve con estado JS antiguo, conexiones
	// rotas y portales de Radix renderizados. Reload limpio para que el
	// servidor vuelva a mandar el estado real.
	useEffect(() => {
		function onPageShow(e: PageTransitionEvent) {
			if (e.persisted) window.location.reload();
		}
		window.addEventListener("pageshow", onPageShow);
		return () => window.removeEventListener("pageshow", onPageShow);
	}, []);

	useEffect(() => {
		if (!when) return;

		function onBeforeUnload(e: BeforeUnloadEvent) {
			// No disparar onUnload aquí: lo haría antes del dialog nativo
			// y si el user cancela ya da igual, la acción destructiva
			// ya corrió.
			e.preventDefault();
			e.returnValue = "";
		}

		function onPageHide() {
			onUnloadRef.current?.();
		}

		window.addEventListener("beforeunload", onBeforeUnload);
		window.addEventListener("pagehide", onPageHide);
		return () => {
			window.removeEventListener("beforeunload", onBeforeUnload);
			window.removeEventListener("pagehide", onPageHide);
		};
	}, [when]);

	const confirmExit = useCallback(async () => {
		if (!pendingHref) return;
		setIsConfirming(true);
		isExitingRef.current = true;
		try {
			await onConfirmExit();
			if (pendingHref === BACK_MARKER) {
				// go(-2) salta tanto el dummy como la entrada real de /active.
				history.go(-2);
			} else {
				router.push(pendingHref);
			}
		} finally {
			setIsConfirming(false);
			setPendingHref(null);
		}
	}, [pendingHref, onConfirmExit, router]);

	const cancelExit = useCallback(() => {
		setPendingHref(null);
	}, []);

	return { pendingHref, isConfirming, confirmExit, cancelExit };
}
