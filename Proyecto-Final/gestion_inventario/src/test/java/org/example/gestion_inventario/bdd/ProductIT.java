package org.example.gestion_inventario.bdd;

import org.junit.platform.suite.api.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = "cucumber.glue", value = "org.example.gestion_inventario.bdd")
@ConfigurationParameter(key = "cucumber.plugin", value = "pretty")
public class ProductIT {
}