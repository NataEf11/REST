package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String userInfo(@AuthenticationPrincipal User principal, Model model) {
        // Получаем текущего пользователя
        User currentUser = userService.getUserById(principal.getId());

        // Получаем всех пользователей с ролью USER
        List<User> users = userService.getAllUsers().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("ROLE_USER")))
                .collect(Collectors.toList());

        model.addAttribute("currentUser", currentUser);
        model.addAttribute("users", users); // Передаем список пользователей с ролью USER
        return "user/info";
    }
}