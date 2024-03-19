window.addEventListener("DOMContentLoaded",() => {
	const tp = new TootsiePopToggle("[name=dummy]");
});

class TootsiePopToggle {
	/** Checkbox input used for this toggle */
	input: HTMLInputElement | null;
	/** Percentage of the Tootsie Roll center revealed */
	licked: number = 0;

	/**
	 * @param inputEl Selector of the checkbox input to use
	 */
	constructor(inputEl: string) {
		this.input = document.querySelector(inputEl);

		if (!this.input) {
			console.warn(`“${inputEl}” couldn’t be found.`);
		} else {
			const { role, type } = this.input;

			if (type !== "checkbox" || role !== "switch") {
				console.warn(`“${inputEl}” must be a checkbox with the switch role.`);
			} else {
				this.input.addEventListener("change",this.lick.bind(this));
			}
		}
	}
	/** Slowly reveal the Tootsie Roll center. */
	lick(): void {
		if (this.licked < 1) {
			this.licked += 0.1 * Utils.random();
		}
		// allow the complete licked state to show before resetting
		if (this.licked > 1) {
			this.licked = 1;
		} else if (this.licked === 1) {
			this.licked = 0;
		}
		// display the state in CSS
		this.input?.parentElement?.style.setProperty("--licked",`${this.licked.toFixed(2)}`);
	}
}
class Utils {
	/** Generate a random number between 0 and 1. */
	static random(): number {
		return crypto.getRandomValues(new Uint32Array(1))[0] / 2**32;
	}
}
