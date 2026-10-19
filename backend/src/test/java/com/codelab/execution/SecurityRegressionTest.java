package com.codelab.execution;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SecurityRegressionTest {

    private ProcessRunner mockRunner;
    private DockerExecutor executor;

    @BeforeEach
    void setUp() {
        mockRunner = mock(ProcessRunner.class);
        executor = new DockerExecutor(mockRunner);
    }

    @Test
    void dockerCommandMustBeHardened() throws Exception {
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> {
            String s = String.join(" ", cmd);
            return s.contains("--network none")
                    && s.contains("--read-only")
                    && s.contains("--tmpfs /tmp:exec,size=64m")
                    && s.contains("--pids-limit 64")
                    && s.contains("--memory 128m")
                    && s.contains("--memory-swap 128m")
                    && s.contains("--cpu-period 100000")
                    && s.contains("--cpu-quota 50000")
                    && s.contains("--cap-drop ALL")
                    && s.contains("--security-opt no-new-privileges")
                    && s.contains("--user 65534:65534")
                    && s.contains("--rm")
                    && !s.contains("--privileged")
                    && !s.contains("/var/run/docker.sock");
        }), anyString(), eq(10L));
    }

    @Test
    void containerMustNotHavePrivilegedFlag() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print(1)", "");
        verify(mockRunner).run(argThat(cmd -> {
            String j = String.join(" ", cmd);
            return !j.contains("--privileged") && !j.contains("--cap-add");
        }), anyString(), anyLong());
    }

    @Test
    void dockerCommandMustIsolateNetwork() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("c", "int main(){return 0;}", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("--network none")), anyString(), anyLong());
    }

    @Test
    void readOnlyRootMustBeEnforced() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("--read-only")), anyString(), anyLong());
    }

    @Test
    void memoryLimitMustBeStrict() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> {
            String s = String.join(" ", cmd);
            return s.contains("--memory 128m") && s.contains("--memory-swap 128m");
        }), anyString(), anyLong());
    }

    @Test
    void cpuLimitMustBeExplicit() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> {
            String s = String.join(" ", cmd);
            return s.contains("--cpu-period 100000") && s.contains("--cpu-quota 50000");
        }), anyString(), anyLong());
    }

    @Test
    void pidLimitMustBeSet() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("--pids-limit 64")), anyString(), anyLong());
    }

    @Test
    void capDropAndNoNewPrivilegesMustBeSet() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> {
            String s = String.join(" ", cmd);
            return s.contains("--cap-drop ALL") && s.contains("--security-opt no-new-privileges");
        }), anyString(), anyLong());
    }

    @Test
    void nonRootUserMustBeSet() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong())).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("python", "print('hi')", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("--user 65534:65534")), anyString(), anyLong());
    }
}
