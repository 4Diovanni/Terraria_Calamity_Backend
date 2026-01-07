package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.WeaponService;
import com.terraria.calamity.domain.dto.CreateWeaponDTO;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Weapon;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weapons")
@RequiredArgsConstructor
public class WeaponController {
    private final WeaponService weaponService;

    @PostMapping
    public ResponseEntity<WeaponResponseDTO> create(@Valid @RequestBody CreateWeaponDTO dto) {
        WeaponResponseDTO response = weaponService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WeaponResponseDTO>> findAll() {
        List<WeaponResponseDTO> weapons = weaponService.findAll();
        return ResponseEntity.ok(weapons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> findById(@PathVariable Long id) {
        WeaponResponseDTO weapon = weaponService.findById(id);
        return ResponseEntity.ok(weapon);
    }

    @GetMapping("/class/{weaponClass}")
    public ResponseEntity<List<WeaponResponseDTO>> findByClass(@PathVariable Weapon.WeaponClass weaponClass) {
        List<WeaponResponseDTO> weapons = weaponService.findByClass(weaponClass);
        return ResponseEntity.ok(weapons);
    }

    @GetMapping("/element/{element}")
    public ResponseEntity<List<WeaponResponseDTO>> findByElement(@PathVariable Weapon.Element element) {
        List<WeaponResponseDTO> weapons = weaponService.findByElement(element);
        return ResponseEntity.ok(weapons);
    }

    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<WeaponResponseDTO>> findByRarity(@PathVariable Integer rarity) {
        List<WeaponResponseDTO> weapons = weaponService.findByRarity(rarity);
        return ResponseEntity.ok(weapons);
    }

    @GetMapping("/search")
    public ResponseEntity<List<WeaponResponseDTO>> search(@RequestParam String name) {
        List<WeaponResponseDTO> weapons = weaponService.searchByName(name);
        return ResponseEntity.ok(weapons);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> update(@PathVariable Long id, @Valid @RequestBody CreateWeaponDTO dto) {
        WeaponResponseDTO response = weaponService.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        weaponService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
