import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongod = new MongoMemoryServer();
        const uri = await mongod.getUri();
        return {
          uri: uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TestDatabaseModule {}
