package com.eplugger.service;

import com.eplugger.config.AppSsoUiProperties;
import com.eplugger.domain.entity.EpworkSsoExchangeCode;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.EpworkSsoExchangeCodeRepository;
import com.eplugger.repository.EpworkSsoNonceRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.security.EpWorkAppTokenVerifier;
import com.eplugger.security.JwtUtil;
import com.eplugger.web.dto.LoginResponse;
import com.eplugger.web.dto.UserMeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EpWorkSsoServiceTest {

    @Mock
    private EpWorkAppTokenVerifier tokenVerifier;
    @Mock
    private EpworkSsoNonceRepository nonceRepository;
    @Mock
    private EpworkSsoExchangeCodeRepository exchangeCodeRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private AuthService authService;
    @Mock
    private UserIdAllocationService userIdAllocationService;

    private AppSsoUiProperties ssoUi;
    private EpWorkSsoService service;

    @BeforeEach
    void setUp() {
        ssoUi = new AppSsoUiProperties();
        ssoUi.setFrontendCallbackUrl("http://localhost:5173/sso/callback");
        service = new EpWorkSsoService(
                tokenVerifier,
                nonceRepository,
                exchangeCodeRepository,
                userRepository,
                jwtUtil,
                authService,
                ssoUi,
                userIdAllocationService
        );
    }

    @Test
    void buildFrontendRedirect_nonceReplay_throws() {
        Map<String, Object> payload = minimalPayload("dup-nonce");
        when(tokenVerifier.verify("tok")).thenReturn(payload);
        when(nonceRepository.save(any())).thenThrow(new DataIntegrityViolationException("dup"));

        assertThrows(IllegalArgumentException.class, () -> service.buildFrontendRedirectAfterSso("tok"));
    }

    @Test
    void redeemExchangeCode_secondUse_throws() {
        User u = new User();
        u.setId(1L);
        EpworkSsoExchangeCode row = new EpworkSsoExchangeCode();
        row.setCode("abc");
        row.setUser(u);
        row.setExpiresAt(Instant.now().plusSeconds(60));
        row.setUsed(true);

        when(exchangeCodeRepository.findById("abc")).thenReturn(Optional.of(row));

        assertThrows(IllegalArgumentException.class, () -> service.redeemExchangeCode("abc"));
        verify(exchangeCodeRepository, never()).save(any());
    }

    @Test
    void redeemExchangeCode_success_marksUsedAndReturnsJwt() {
        User u = new User();
        u.setId(42L);
        EpworkSsoExchangeCode row = new EpworkSsoExchangeCode();
        row.setCode("good");
        row.setUser(u);
        row.setExpiresAt(Instant.now().plusSeconds(60));
        row.setUsed(false);

        when(exchangeCodeRepository.findById("good")).thenReturn(Optional.of(row));
        when(jwtUtil.issueToken("42")).thenReturn("jwt-42");
        when(authService.toUserMeResponse(u)).thenReturn(new UserMeResponse("42", "N", null, "", null));

        LoginResponse res = service.redeemExchangeCode("good");
        assertEquals("jwt-42", res.getToken());

        ArgumentCaptor<EpworkSsoExchangeCode> cap = ArgumentCaptor.forClass(EpworkSsoExchangeCode.class);
        verify(exchangeCodeRepository).save(cap.capture());
        assertEquals(true, cap.getValue().isUsed());
    }

    private static Map<String, Object> minimalPayload(String nonce) {
        Map<String, Object> m = new HashMap<>();
        m.put("uid", "ext-1");
        m.put("systemCode", "c");
        m.put("displayName", "N");
        m.put("role", "R");
        m.put("email", "");
        m.put("mobile", "13800000000");
        m.put("avatarUrl", "");
        m.put("nonce", nonce);
        m.put("issuer", "epWorkApp");
        return m;
    }
}
