import { VehicleService } from '../src/modules/vehicle-service/vehicle.service';
import { Logger } from '@nestjs/common';
import { AiActions } from '../src/modules/interfaces/ai-actions';
import { VehicleServiceRepository } from '../src/modules/interfaces/vehicle-service.repository';
import { ReminderRepository } from '../src/modules/interfaces/reminder.repository';
import { QueueService } from '../src/modules/vehicle-service/queue.service';
import { ApiIntegrationService } from '../src/modules/commons/api-integration.service';
import { VehicleServiceMapper } from '../src/modules/vehicle-service/vehicle-service.mapper';
import {VehicleServiceRequestDto} from "../src/modules/vehicle-service/dto/vehicle-service-request.dto";

describe('VehicleService', () => {
    let vehicleService: VehicleService;
    let mockAIService: AiActions;
    let mockVehicleServiceRepository: VehicleServiceRepository;
    let mockReminderRepository: ReminderRepository;
    let mockQueueService: QueueService;
    let mockApiIntegrationService: ApiIntegrationService;
    let mockVehicleServiceMapper: VehicleServiceMapper;

    beforeEach(async () => {
        mockAIService = {} as any;
        mockVehicleServiceRepository = {} as any;
        mockReminderRepository = {} as any;
        mockApiIntegrationService = {retryableApiCall: jest.fn()} as any;
        mockVehicleServiceMapper = {} as any;

        mockQueueService = {
            publish: jest.fn(),
            queueClient: {},
            logger: new Logger('QueueService'),
        } as unknown as QueueService;

        // Mock process.env.BATCH_SIZE
        process.env.BATCH_SIZE = '10';

        // Create an instance of VehicleService
        vehicleService = new VehicleService(
            mockAIService,
            mockVehicleServiceRepository,
            mockReminderRepository,
            mockQueueService,
            mockApiIntegrationService,
            mockVehicleServiceMapper,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processUploadCsv', () => {
        it('should process CSV in batches and publish each batch', async () => {
            const content = Array(25).fill({}); // Mock CSV content
            const filename = 'test.csv';
            const batchSize = 10;

            mockVehicleServiceMapper.mapToVehicleServiceRequestDto = jest.fn().mockReturnValue(content);

            await vehicleService.processUploadCsv(content, filename);

            expect(mockVehicleServiceMapper.mapToVehicleServiceRequestDto).toHaveBeenCalledWith(content);
            expect(mockQueueService.publish).toHaveBeenCalledTimes(3);
            expect(mockQueueService.publish).toHaveBeenCalledWith(expect.any(Array), 1);
            expect(mockQueueService.publish).toHaveBeenCalledWith(expect.any(Array), 2);
            expect(mockQueueService.publish).toHaveBeenCalledWith(expect.any(Array), 3);
        });
    });

    describe('processNews', () => {
        it('should clean, enrich, and process news items', async () => {
            const services: Array<VehicleServiceRequestDto> = [
                {
                    name: "Alejandro Ibáñez",
                    phone: "+52 (33) 4444-3333",
                    vehicle: "Nissantro Rogue",
                    plate: "AY 123 XW",
                    service: "Alineacion y Balanceo",
                    date: "14/09/2021",
                },
                {
                    name: "ÁLVAREZ, SEBASTIÁN",
                    phone: "+52 (33) 1111-2222",
                    vehicle: "Ford Focus",
                    plate: "EY 345 XW",
                    service: "Service 20k",
                    date: "14/05/2021",
                },
            ]; // Mock input
            const batchNumber = 1;

            const retryableApiCallSpy = jest.spyOn(mockApiIntegrationService, 'retryableApiCall')
                .mockResolvedValueOnce(JSON.stringify([{ isValid: true }]))
                .mockResolvedValueOnce(JSON.stringify([{ name: "Test Enriched" }]));

            mockVehicleServiceMapper.jsonArrayToEnrichedVehicleServiceDto = jest.fn()
                .mockResolvedValueOnce([{ isValid: true }, { isValid: true }])
                .mockResolvedValueOnce([{ name: "Test Enriched" }, { name: "Test Enriched2" }]);

            const processSingleNewsItemSpy = jest
                .spyOn(vehicleService as any, 'processSingleNewsItem')
                .mockResolvedValue(undefined);

            await vehicleService.processNews(services, batchNumber);

            expect(retryableApiCallSpy).toHaveBeenCalledTimes(2);
            expect(mockVehicleServiceMapper.jsonArrayToEnrichedVehicleServiceDto).toHaveBeenCalledTimes(2);
            expect(processSingleNewsItemSpy).toHaveBeenCalledTimes(2);
        });

        it('should log an error if processing fails', async () => {
            const services: Array<VehicleServiceRequestDto> = [
                {
                    name: "Alejandro Ibáñez",
                    phone: "+52 (33) 4444-3333",
                    vehicle: "Nissantro Rogue",
                    plate: "AY 123 XW",
                    service: "Alineacion y Balanceo",
                    date: "14/09/2021",
                },
            ];
            const batchNumber = 1;

            const retryableApiCallSpy = jest.spyOn(mockApiIntegrationService, 'retryableApiCall')
                .mockRejectedValue(new Error('Error cleaning data'));

            const loggerErrorSpy = jest.spyOn(vehicleService['logger'], 'error');

            await vehicleService.processNews(services, batchNumber);

            // Ensure the logger.error method is called with the expected parameters
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                'An error occurred during the news processing.',
                expect.any(Error), // Check that an error object was passed
            );
        });
    });
});
