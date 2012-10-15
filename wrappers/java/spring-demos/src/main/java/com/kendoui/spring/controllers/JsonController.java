package com.kendoui.spring.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.kendoui.spring.models.ProductDao;
import com.kendoui.taglib.DataSourceRequest;
import com.kendoui.taglib.DataSourceResult;

@Controller
@RequestMapping(value="/json")
public class JsonController {
    @Autowired 
    private ProductDao product;
    
    @RequestMapping(value = "/products", method = RequestMethod.POST)
    public @ResponseBody DataSourceResult products(DataSourceRequest request) {

        return product.getList(request);
    }
}
