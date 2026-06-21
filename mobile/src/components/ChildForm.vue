<template>
	<div class="child-form">
		<div v-if="errorMessage" class="form-error">
			<IonIcon :icon="alertCircleOutline" />
			{{ errorMessage }}
		</div>

		<div class="field">
			<label class="field-label">Jméno miminka</label>
			<input v-model="name" type="text" class="field-input" />
		</div>

		<div class="field">
			<label class="field-label">Pohlaví</label>
			<div class="gender-pick">
				<button type="button" class="gender-option girl" :class="{ selected: gender === 'girl' }" @click="gender = 'girl'">
					<div class="gender-icon"><IonIcon :icon="femaleOutline" /></div>
					<span>Holčička</span>
					<div v-if="gender === 'girl'" class="gender-check"><IonIcon :icon="checkmark" /></div>
				</button>
				<button type="button" class="gender-option boy" :class="{ selected: gender === 'boy' }" @click="gender = 'boy'">
					<div class="gender-icon"><IonIcon :icon="maleOutline" /></div>
					<span>Chlapeček</span>
					<div v-if="gender === 'boy'" class="gender-check"><IonIcon :icon="checkmark" /></div>
				</button>
			</div>
		</div>

		<div class="field">
			<label class="field-label">Datum narození</label>
			<input v-model="birthDate" type="date" class="field-input" />
		</div>
	</div>
</template>

<script setup>
import { IonIcon } from "@ionic/vue";
import { femaleOutline, maleOutline, checkmark, alertCircleOutline } from "ionicons/icons";

defineOptions({ name: "ChildForm" });

const name = defineModel("name", { default: "" });
const gender = defineModel("gender", { default: "" });
const birthDate = defineModel("birthDate", { default: "" });

defineProps({
	errorMessage: {
		type: String,
		default: "",
	},
});
</script>

<style scoped>
.child-form {
	display: flex;
	flex-direction: column;
	gap: 22px;
}

.form-error {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 13px 15px;
	border-radius: 14px;
	background: #fdecec;
	color: #e05555;
	font-size: 0.95rem;
	font-weight: 600;
}

.form-error ion-icon {
	font-size: 20px;
	flex-shrink: 0;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 9px;
}

.field-label {
	font-size: 0.92rem;
	font-weight: 700;
	color: var(--ion-text-color);
}

.field-input {
	width: 100%;
	padding: 15px 16px;
	border-radius: 14px;
	border: 1.5px solid #e8e4f0;
	background: #fff;
	font-size: 1.05rem;
	font-weight: 600;
	color: var(--ion-text-color);
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	outline: none;
	appearance: none;
	-webkit-appearance: none;
	transition: border 0.15s, box-shadow 0.15s;
}

.field-input::placeholder {
	color: #888;
	font-weight: 500;
}

.field-input:focus {
	border-color: #67b18c;
	box-shadow: 0 0 0 3px rgba(103, 177, 140, 0.18);
}

input[type="date"].field-input {
	display: block;
	min-height: 54px;
	color: var(--ion-text-color);
}

.gender-pick {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.gender-option {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 9px;
	padding: 18px 8px;
	border-radius: 14px;
	border: 1.5px solid #e8e4f0;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: all 0.15s;
}

.gender-icon {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26px;
}

.gender-option span {
	font-size: 1rem;
	font-weight: 700;
	color: #666;
}

.gender-check {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 14px;
}

.gender-option.girl .gender-icon {
	background: #fdf4f8;
	color: #d27a9e;
}

.gender-option.girl.selected {
	border-color: #eeb6cd;
	background: #fcebf2;
	box-shadow: 0 4px 14px #fdf4f8;
}

.gender-option.girl.selected .gender-icon {
	background: #fff;
}

.gender-option.girl.selected span {
	color: #d27a9e;
}

.gender-option.girl .gender-check {
	background: #d27a9e;
}

.gender-option.boy .gender-icon {
	background: #f3f6fd;
	color: #697eca;
}

.gender-option.boy.selected {
	border-color: #b3c0ec;
	background: #e9edfb;
	box-shadow: 0 4px 14px #f3f6fd;
}

.gender-option.boy.selected .gender-icon {
	background: #fff;
}

.gender-option.boy.selected span {
	color: #697eca;
}

.gender-option.boy .gender-check {
	background: #697eca;
}
</style>
