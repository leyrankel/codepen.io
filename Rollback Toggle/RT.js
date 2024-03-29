window.addEventListener("DOMContentLoaded",() => {
	const rt = new RollbackToggle("#dummy");
});

class RollbackToggle {
	/** Input used for this switch */
	input: HTMLInputElement | null;
	/** Used for the timeout function triggering switch restoration */
	restoreTimeout: number = 0;
	/**
	 * @param el CSS selector of the switch input
	 */
	constructor(el: string) {
		this.input = document.querySelector(el);
		this.input?.addEventListener("change", this.run.bind(this));
	}
	/** Milliseconds until the switch is restored. This uses the animation duration. */
	get restoreTime(): number {
		if (!this.input) return 1;

		const dur = window.getComputedStyle(this.input).getPropertyValue("--dur");
		const isMs = dur.indexOf("ms") > -1;
		const unit: Time = isMs ? "ms" : "s";
		let value = +dur.substring(0,dur.indexOf(unit));

		if (!isMs) value *= 1e3;

		return value;
	}
	/** Disable the switch while the handle rolls. */
	run(): void {
		if (this.input) {
			this.input.disabled = true;
			this.restoreTimeout = setTimeout(this.restore.bind(this),this.restoreTime);
		}
	}
	/** Restore the switch state. */
	restore(): void {
		if (this.input) {
			this.input.checked = false;
			this.input.disabled = false;
		}
	}
}
/** Seconds or milliseconds */
type Time = "s" | "ms";
