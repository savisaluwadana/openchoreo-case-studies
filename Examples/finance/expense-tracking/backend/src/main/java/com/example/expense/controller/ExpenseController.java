package com.example.expense.controller;

import com.example.expense.model.Expense;
import com.example.expense.repository.ExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {
    private final ExpenseRepository repo;
    public ExpenseController(ExpenseRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Expense> list(@RequestParam(required = false) String employeeId) {
        if (employeeId != null) return repo.findByEmployeeId(employeeId);
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Expense e) {
        Expense saved = repo.save(e);
        return ResponseEntity.created(URI.create("/api/v1/expenses/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody Expense e) {
        return repo.findById(id).map(existing -> {
            e.setId(id);
            Expense updated = repo.save(e);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
