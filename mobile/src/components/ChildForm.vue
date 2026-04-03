<template>
	<div class="child-form">
		<div class="form-group">
			<label>Jméno miminka</label>
			<input v-model="name" type="text" />
		</div>

		<div class="form-group">
			<label>Pohlaví</label>
			<select v-model="gender">
				<option value="">Vyberte pohlaví</option>
				<option value="girl">Holčička</option>
				<option value="boy">Chlapeček</option>
			</select>
		</div>

		<div class="form-group">
			<label>Datum narození</label>
			<input v-model="birthDate" type="date" />
		</div>

		<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
	</div>
</template>

<script setup>
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
.form-group {
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;

	label {
		display: block;
		margin-bottom: 6px;
	}
}

.error-message {
	margin: 0 0 12px;
	color: #d24343;
	font-size: 14px;
}

input,
select {
	width: 100%;
	padding: 14px;
	border-radius: 16px;
	border: 1px solid #ddd;
	font-size: 16px;
	background-color: #fff;
	color: #2b2b2b;
	appearance: none;
	-webkit-appearance: none;
}

input[type="date"] {
	display: block;
	min-height: 52px;
}

input:focus,
select:focus {
	outline: none;
	border-color: #66bb6a;
	box-shadow: 0 0 0 2px rgba(102, 187, 106, 0.2);
}
</style>
