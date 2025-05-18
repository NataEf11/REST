package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Set;

public interface UserService extends UserDetailsService {
    User findByUsername(String username);
    User getUserById(Long id);
    User getUserWithRoles(Long id);
    List<User> getAllUsers();
    Set<Role> getAllRoles();
    Role getRoleById(Long id);
    void saveUser(User user);
    void updateUser(User user);
    void deleteUser(Long id);
    User getCurrentUser();
}