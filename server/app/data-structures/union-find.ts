import { StrictMap } from './strict-map';

export class UnionFind {
    map: Map<string, string>;
    sizes: StrictMap<string, number>;

    roots: Set<string>;

    constructor() {
        this.map = new Map<string, string>();
        this.sizes = new StrictMap<string, number>();
        this.roots = new Set<string>();
    }

    find(element: string) {
        const tree: string[] = [element];
        let previous: string;
        let parent: string;
        do {
            previous = tree[tree.length - 1];
            const tempParent = this.map.get(previous);
            if (tempParent === undefined) return tempParent;
            parent = tempParent;
            if (parent !== previous) {
                tree.push(parent);
            }
        } while (parent !== previous);
        const root = tree[tree.length - 1];

        tree.forEach((node) => this.map.set(node, root));

        return root;
    }

    connected(first: string, second: string) {
        return this.find(first) === this.find(second);
    }

    union(first: string, second: string) {
        let firstRoot = this.find(first);
        let secondRoot = this.find(second);

        if (firstRoot === undefined) {
            this.createSet(first);
            firstRoot = first;
        }
        if (secondRoot === undefined) {
            this.createSet(second);
            secondRoot = second;
        }

        if (this.connected(first, second)) return;

        const firstSize = this.sizes.get(firstRoot);
        const secondSize = this.sizes.get(secondRoot);

        if (firstSize < secondSize) {
            this.sizes.set(secondRoot, secondSize + firstSize);
            this.map.set(firstRoot, secondRoot);
            this.sizes.set(firstRoot, 0);
            this.roots.delete(firstRoot);
        } else {
            this.sizes.set(firstRoot, firstSize + secondSize);
            this.map.set(secondRoot, firstRoot);
            this.sizes.set(secondRoot, 0);
            this.roots.delete(secondRoot);
        }
    }

    inSet(element: string) {
        return this.find(element) !== undefined;
    }

    createSet(element: string) {
        if (!this.inSet(element)) {
            this.map.set(element, element);
            this.sizes.set(element, 1);
            this.roots.add(element);
        }
    }
}
