<template>
  <div style="padding:20px;font-family:sans-serif">
    <h1>Invoices</h1>
    <button @click="load">Refresh</button>
    <table border="1" cellpadding="8" style="border-collapse:collapse;margin-top:10px;width:100%">
      <thead><tr><th>ID</th><th>Number</th><th>Customer</th><th>Amount</th><th>Due</th></tr></thead>
      <tbody>
        <tr v-for="i in invoices" :key="i.id">
          <td>{{ i.id }}</td>
          <td>{{ i.invoice_number }}</td>
          <td>{{ i.customer_name }}</td>
          <td>{{ i.amount }}</td>
          <td>{{ i.due_date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const API = (typeof window !== 'undefined' && window.configs?.apiUrl) ? window.configs.apiUrl : (import.meta.env.VITE_API_URL || 'http://localhost:8081')
export default {
  data() { return { invoices: [] } },
  methods: {
    async load() { const res = await fetch(`${API}/api/v1/invoices`); this.invoices = await res.json() }
  }, mounted() { this.load() }
}
</script>
