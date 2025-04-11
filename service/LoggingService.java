package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.Logging;
import com.java.bank.utils.PageResponse;

public interface LoggingService extends IService<Logging> {

    PageResponse<Logging> getAllLogging(String content, Integer pageNo, Integer pageSize);

    void deleteLoggingByIds(String ids);
}
