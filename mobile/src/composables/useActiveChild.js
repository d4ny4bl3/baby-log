import { ref } from "vue";
import { getChildren, getActiveChildId, setActiveChildId } from "@/database/queries";

const children = ref([]);
const activeChildId = ref(null);

export function useActiveChild() {
	async function loadChildrenContext() {
		children.value = await getChildren();
		if (children.value.length === 0) {
			activeChildId.value = null;
			return;
		}

		const storedId = await getActiveChildId();
		const exists = children.value.some((c) => c.id === storedId);

		activeChildId.value = exists ? storedId : children.value[0].id;
		if (!exists) await setActiveChildId(activeChildId.value);
	}

	async function changeActiveChild(childId) {
		if (!childId || childId === activeChildId.value) return;
		activeChildId.value = childId;
		await setActiveChildId(childId);
	}

	return { children, activeChildId, loadChildrenContext, changeActiveChild };
}
