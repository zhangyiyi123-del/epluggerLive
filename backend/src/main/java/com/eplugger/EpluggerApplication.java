package com.eplugger;

import com.eplugger.config.AppSsoUiProperties;
import com.eplugger.config.BusinessDataSourceProperties;
import com.eplugger.config.EpWorkPersonnelDataSourceProperties;
import com.eplugger.config.EpWorkPersonnelSyncProperties;
import com.eplugger.config.EpWorkSsoProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@EnableScheduling
@EnableConfigurationProperties({
        BusinessDataSourceProperties.class,
        EpWorkSsoProperties.class,
        AppSsoUiProperties.class,
        EpWorkPersonnelSyncProperties.class,
        EpWorkPersonnelDataSourceProperties.class
})
public class EpluggerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EpluggerApplication.class, args);
    }
}
