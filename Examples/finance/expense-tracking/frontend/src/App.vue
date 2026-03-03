<template>
  <div style="padding:20px; font-family: sans-serif">
    <h1>Expense Tracking</h1>
    <button @click="load">Refresh</button>
    <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; margin-top:10px">
      <thead><tr><th>ID</th><th>Employee</th><th>Amount</th><th>Date</th><th>Category</th></tr></thead>
      <tbody>
        <tr v-for="e in expenses" :key="e.id">
          <td>{{ e.id }}</td>
          <td>{{ e.employeeId }}</td>
          <td>{{ e.amount }}</td>
          <td>{{ e.incurredAt }}</td>
          <td>{{ e.category }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const API = (typeof window !== 'undefined' && window.configs?.apiUrl) ? window.configs.apiUrl : (import.meta.env.VITE_API_URL || 'http://localhost:8080')
export default {
  data() { return { expenses: [] } },
  methods: {
    async load() {
      const res = await fetch(`${API}/api/v1/expenses`)
      const data = await res.json()
      this.expenses = data || []
    }
  },
  mounted() { this.load() }
}
</script>
