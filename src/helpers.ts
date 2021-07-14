export function withDefaultPrevented(f: (ev: MouseEvent) => void): (ev: MouseEvent) => void {
    return function(ev: MouseEvent): void {
        ev.preventDefault();
        f(ev);
        ev.stopPropagation();
    };
}
