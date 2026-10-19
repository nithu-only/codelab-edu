package com.codelab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WorkspaceConfig {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceConfig.class);

    @Value("${codelab.workspace.root:workspaces}")
    private String workspaceRootProp;

    @Bean
    public Path workspaceRoot() throws IOException {
        String envOverride = System.getenv("WORKSPACE_ROOT");
        String raw = (envOverride != null && !envOverride.isBlank()) ? envOverride : workspaceRootProp;
        if (raw == null || raw.isBlank()) {
            raw = "workspaces";
        }
        Path root = Paths.get(raw);
        if (!root.isAbsolute()) {
            // resolve relative to current working dir (backend)
            root = Paths.get(System.getProperty("user.dir")).resolve(raw).normalize();
            // if user.dir resolution fails to be portable, fallback to absolute
            if (!Files.exists(root.getParent()) && raw.equals("workspaces")) {
                root = Paths.get(raw).toAbsolutePath().normalize();
            }
        } else {
            root = root.normalize();
        }
        // Ensure root and students subdir exist
        Files.createDirectories(root);
        Files.createDirectories(root.resolve("students"));
        log.info("Workspace root resolved to {}", root.toAbsolutePath());
        return root.toAbsolutePath().normalize();
    }
}
